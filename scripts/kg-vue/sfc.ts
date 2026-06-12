// AST extraction for .vue/.ts. A real parse (vs regex) sees kebab-case tags,
// ignores comments/strings, and skips local bindings that shadow auto-imports.
import { parse, babelParse } from "vue/compiler-sfc";

export type SfcExtract = {
  componentNames: string[]; // normalized PascalCase names to look up in components.d.ts
  importSpecs: string[]; // raw import specifiers, for the resolver
  composableCandidates: string[]; // identifier uses that are NOT locally bound
};

// unplugin-vue-components resolves tags via camelize + capitalize, so kebab-case
// and PascalCase forms map onto the same manifest key.
function toPascal(tag: string): string {
  const camel = tag.replace(/-(\w)/g, (_m, c: string) => c.toUpperCase());
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

// ElementTypes.COMPONENT from @vue/compiler-core — the parser already classifies
// native (0) vs component (1) tags, kebab-case included. No hardcoded tag list.
const COMPONENT_TAG_TYPE = 1;

// Walk the compiled template AST collecting component tag names. Native elements
// (tagType 0) and text/interpolation nodes (no `tag`) are skipped.
function collectTemplateTags(node: unknown, out: Set<string>): void {
  if (!node || typeof node !== "object") return;
  const n = node as Record<string, unknown>;
  if (typeof n.tag === "string" && n.tagType === COMPONENT_TAG_TYPE) out.add(n.tag);
  const children = n.children;
  if (Array.isArray(children)) for (const c of children) collectTemplateTags(c, out);
  const branches = n.branches; // v-if / v-else-if / v-else
  if (Array.isArray(branches)) for (const b of branches) collectTemplateTags(b, out);
}

type AnyNode = Record<string, unknown>;

// Keys on a Babel node that hold position/comment data, never child AST nodes.
const NON_AST_KEYS = new Set([
  "loc",
  "start",
  "end",
  "range",
  "extra",
  "leadingComments",
  "trailingComments",
  "innerComments",
  "comments",
  "tokens",
]);

type ScriptScan = {
  importSpecs: string[];
  resolveComponentNames: string[];
  identifierUses: Set<string>;
  localBindings: Set<string>;
};

function isNode(v: unknown): v is AnyNode {
  return !!v && typeof v === "object" && typeof (v as AnyNode).type === "string";
}

function literalString(v: unknown): string | null {
  if (isNode(v) && (v.type === "StringLiteral" || v.type === "Literal")) {
    const value = v.value;
    return typeof value === "string" ? value : null;
  }
  return null;
}

// Record names declared locally so a same-named auto-import is NOT counted as used.
function recordBindings(node: AnyNode, out: Set<string>): void {
  const collectPattern = (pat: unknown): void => {
    if (!isNode(pat)) return;
    if (pat.type === "Identifier" && typeof pat.name === "string") out.add(pat.name);
    else if (pat.type === "ObjectPattern" && Array.isArray(pat.properties)) {
      for (const p of pat.properties) {
        const pp = p as AnyNode;
        if (pp.type === "ObjectProperty") collectPattern(pp.value);
        else if (pp.type === "RestElement") collectPattern(pp.argument);
      }
    } else if (pat.type === "ArrayPattern" && Array.isArray(pat.elements)) {
      for (const el of pat.elements) collectPattern(el);
    } else if (pat.type === "AssignmentPattern") collectPattern(pat.left);
    else if (pat.type === "RestElement") collectPattern(pat.argument);
  };

  if (node.type === "ImportDeclaration" && Array.isArray(node.specifiers)) {
    for (const s of node.specifiers) {
      const local = (s as AnyNode).local;
      if (isNode(local) && typeof local.name === "string") out.add(local.name);
    }
  } else if (node.type === "VariableDeclarator") {
    collectPattern(node.id);
  } else if (
    (node.type === "FunctionDeclaration" || node.type === "ClassDeclaration") &&
    isNode(node.id) &&
    typeof node.id.name === "string"
  ) {
    out.add(node.id.name);
  }
}

function scanScript(code: string): ScriptScan {
  const scan: ScriptScan = {
    importSpecs: [],
    resolveComponentNames: [],
    identifierUses: new Set(),
    localBindings: new Set(),
  };
  let file: unknown;
  try {
    file = babelParse(code, {
      sourceType: "module",
      plugins: ["typescript"],
      errorRecovery: true,
    });
  } catch {
    return scan; // a parse failure on one block must not abort the whole run
  }

  const walk = (node: unknown, skip?: string): void => {
    if (Array.isArray(node)) {
      for (const c of node) walk(c);
      return;
    }
    if (!isNode(node)) return;

    recordBindings(node, scan.localBindings);

    // Imports + re-exports + dynamic import().
    if (node.type === "ImportDeclaration") {
      const s = literalString(node.source);
      if (s) scan.importSpecs.push(s);
    } else if (
      (node.type === "ExportNamedDeclaration" || node.type === "ExportAllDeclaration") &&
      node.source
    ) {
      const s = literalString(node.source);
      if (s) scan.importSpecs.push(s);
    } else if (node.type === "CallExpression") {
      const callee = node.callee as AnyNode | undefined;
      const args = Array.isArray(node.arguments) ? node.arguments : [];
      if (callee?.type === "Import") {
        const s = literalString(args[0]);
        if (s) scan.importSpecs.push(s);
      } else if (callee?.type === "Identifier" && callee.name === "resolveComponent") {
        const name = literalString(args[0]);
        if (name) scan.resolveComponentNames.push(toPascal(name));
      }
    } else if (node.type === "Identifier" && typeof node.name === "string" && node.name !== skip) {
      scan.identifierUses.add(node.name);
    }

    // Recurse, skipping non-AST keys and binding/key positions that are not
    // value references (a member `.ref` or an object key `ref:` is not a use).
    for (const [key, value] of Object.entries(node)) {
      if (NON_AST_KEYS.has(key)) continue;
      if (node.type === "MemberExpression" && key === "property" && node.computed === false)
        continue;
      if (
        (node.type === "ObjectProperty" || node.type === "ObjectMethod") &&
        key === "key" &&
        node.computed === false
      ) {
        continue;
      }
      walk(value);
    }
  };

  walk(file);
  return scan;
}

function composablesFrom(scan: ScriptScan): string[] {
  const out: string[] = [];
  for (const name of scan.identifierUses) {
    if (!scan.localBindings.has(name)) out.push(name);
  }
  return out;
}

// Parse a .vue SFC: component tags from the template, imports + composable uses
// from the script blocks.
export function extractFromVue(source: string, filename: string): SfcExtract {
  const componentNames = new Set<string>();
  const importSpecs = new Set<string>();
  const composableCandidates = new Set<string>();

  const { descriptor } = parse(source, { filename });

  if (descriptor.template?.ast) {
    const tags = new Set<string>();
    collectTemplateTags(descriptor.template.ast, tags);
    for (const tag of tags) componentNames.add(toPascal(tag));
  }

  for (const block of [descriptor.scriptSetup, descriptor.script]) {
    if (!block?.content) continue;
    const scan = scanScript(block.content);
    for (const s of scan.importSpecs) importSpecs.add(s);
    for (const n of scan.resolveComponentNames) componentNames.add(n);
    for (const c of composablesFrom(scan)) composableCandidates.add(c);
  }

  return {
    componentNames: [...componentNames],
    importSpecs: [...importSpecs],
    composableCandidates: [...composableCandidates],
  };
}

// Parse a plain .ts file: imports + composable uses (no template).
export function extractFromTs(source: string): SfcExtract {
  const scan = scanScript(source);
  return {
    componentNames: [],
    importSpecs: [...new Set(scan.importSpecs)],
    composableCandidates: [...new Set(composablesFrom(scan))],
  };
}

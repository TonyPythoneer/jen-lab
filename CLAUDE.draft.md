---
name: work-guideline-for-ai
description: A portal to guide AI to work precisely and effectively.
---

# Work Guideline for AI

/[toc]

## 0. Forever Principle

- Stupid but fitting answers are always better than brilliant but wrong answers.
  - Must always install `andrej-karpathy-skills@karpathy-skills`.
  - If not installed:
    ```sh
    /plugin marketplace add forrestchang/andrej-karpathy-skills
    /plugin install andrej-karpathy-skills@karpathy-skills
    ```

## 1. Project Management

- Always build a Project Management structure to follow.
- Must always tick tasks after taking action.
- Located and built in `./.claude/project-management/`.
- Task folder format: `./.claude/project-management/<TASK_NAME>/`
- Task files format: `./.claude/project-management/<TASK_NAME>/<two-digit-decimal-index>_<subtask-name>.md`
  - `00_overview.md` is required:
    - Quick brief of all tasks under the folder.
    - Must include a checkbox for each task.
    - No detail here — acts as TOC for all task files.
  - All tasks after `00_overview.md` are sequential. No dependencies, no jumping. Linear only.
  - Lifecycle:
    1. Plan first, break down tasks, self-review to prioritize and remove all dependencies.
    2. First commit on a new branch: create the project management structure with tasks.
    3. Middle commits: take action and write code.
    4. Final commit: delete all project management files after completing coding.
  - No need to run `git diff` for commit messages — you must have context. If I change something manually, I will tell you. Save tokens.
  - Use `./.claude/project-management/<TASK_NAME>/PROGRESS_<task-number>` to track the current task in progress.

## 2. Project Rules

- Follow the current project coding style.
- Follow the current project structure.
- Do not invent your own architecture or style.
- Existing project implementation is the source of truth.

## 3. Model Awareness

1. Never guess — always read first.
   - Be aware of installed libraries:
     - Python: `pyproject.toml`
     - Node.js: `package.json`
   - When coding, do not guess. Always check:
     - LSP server config like `.zed/settings.json`
     - Docs before implementing

2. Token use efficiency:
   - Get my approval for the following — clarify during planning, not mid-task:
     - Never access the internet to read docs.
     - If something is unclear, read the lib folder directly:
       - Python project: `./venv`
       - Node.js project: `./node_modules`

<!-- OPENSPEC:START -->
# OpenSpec Instructions for AI Assistants

Always open `@/openspec/AGENTS.md` and `@/openspec/project.md` when:
- The user mentions planning, proposals, specs, changes, or refactors.
- You introduce new capabilities, architecture changes, or performance/security work.
- The request is ambiguous and you need an authoritative spec before coding.[web:13]

Use this workflow:

1. **Propose** — create or refine a change proposal under `openspec/changes/`.
2. **Plan** — generate a clear `tasks.md` checklist based on the proposal.
3. **Delta** — describe how the system will change in `delta.md`.
4. **Apply** — implement code changes strictly following the spec and tasks.
5. **Verify** — ensure tests and acceptance criteria are satisfied.
6. **Archive** — mark completed changes with `openspec archive`.[web:1][web:7]

Keep this managed block so `openspec update` can refresh the instructions.
<!-- OPENSPEC:END -->
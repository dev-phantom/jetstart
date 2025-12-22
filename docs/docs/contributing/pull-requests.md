---
title: Submitting Changes
description: Pull Request guidelines
---

# Submitting Changes

1. **Update your branch**:
   Ensure your branch is up to date with `main`/`master` before pushing.
   ```bash
   git fetch upstream
   git rebase upstream/master
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/my-feature
   ```

3. **Open a Pull Request**:
   - Go to the original repository.
   - Click "New Pull Request".
   - Select your branch.
   - Fill out the template describing your changes.

4. **Review Process**:
   - A maintainer will review your code.
   - Address any comments.
   - Once approved, it will be merged.

## PR Checklist
- [ ] Tests passed (`npm test`)
- [ ] Linting passed (`npm run lint`)
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow Conventional Commits

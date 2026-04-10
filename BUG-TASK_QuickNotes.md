Build Error:
- File: src/app/(dashboard)/campaigns/new/page.tsx
- Line: 106
- Issue: The `onBlur` property is being passed to a component where it is not defined in the expected type (`Props<string, false>`).

Resolution to attempt:
- Check if `onBlur` is intended to be used with this component. If not, remove or find the correct handler.
- Update component typings to ensure compatibility, or refactor the logic to meet type declarations.
- Retry the build after making changes.
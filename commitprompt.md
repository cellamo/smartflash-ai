<GitCommitMessagePrompt>
Craft a concise, informative commit message following these guidelines:
1. Use imperative mood for subject and body
2. Limit subject line to 50 characters
3. Optionally include a scope (max 50 characters)
4. Provide a detailed single-line description
5. Summarize the diff clearly and accurately
6. Format as a single code block, ready for immediate use

Structure:
[type(optional scope): subject (max 50 chars)]
[blank line]
[body (single line, detailed description)]

Example:
feat(auth): Implement OAuth2 login flow

Add Google and GitHub OAuth providers, update user model, and integrate with existing authentication system
</GitCommitMessagePrompt>
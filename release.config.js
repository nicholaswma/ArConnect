const config = {
  branches: ["production"],
  plugins: [
    "@semantic-release/commit-analyzer",
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "angular", // Assuming you're using the angular preset
        writerOpts: {
          transform: (commit, context) => {
            const issues = [];

            if (
              commit.type === "feat" &&
              commit.notes.length > 0 &&
              commit.message.includes("[include]")
            ) {
              commit.type = "Features";
            } else if (commit.type === "fix") {
              commit.type = "Bug Fixes";
            } else if (
              !commit.type ||
              !["Features", "Bug Fixes"].includes(commit.type)
            ) {
              return;
            }

            if (commit.scope === "*") {
              commit.scope = "";
            }

            if (typeof commit.hash === "string") {
              commit.shortHash = commit.hash.substring(0, 7);
            }

            if (typeof commit.subject === "string") {
              let url = context.repository
                ? `${context.host}/${context.owner}/${context.repository}`
                : context.repoUrl;
              if (url) {
                url = `${url}/issues/`;
                // Issue URLs.
                commit.subject = commit.subject.replace(
                  /#([0-9]+)/g,
                  (_, issue) => {
                    issues.push(issue);
                    return `[#${issue}](${url}${issue})`;
                  }
                );
              }
              // User URLs.
              commit.subject = commit.subject.replace(
                /\B@([a-z0-9](?:-?[a-z0-9]){0,38})/g,
                (_, username) => {
                  if (context.host) {
                    return `[@${username}](${context.host}/${username})`;
                  }
                  return `@${username}`;
                }
              );
            }

            // Remove the reference to issues that were already linked in the subject
            commit.notes = commit.notes.filter(
              (note) => !issues.includes(note.issue)
            );

            return commit;
          }
        }
      }
    ],
    [
      "@semantic-release/npm",
      {
        npmPublish: false
      }
    ],
    [
      "@semantic-release/git",
      {
        assets: ["package.json"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    "@semantic-release/github"
  ]
};

module.exports = config;

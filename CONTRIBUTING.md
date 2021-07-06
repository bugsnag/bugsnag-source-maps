# Contributing

## Testing

A full guide to testing can be found in the [testing](./TESTING.md) document

## Releases

To start a release:

- decide on a version number
- create a new release branch from `next` with the version number in the branch name `git checkout -b release/vX.Y.Z`
- review commits made to `next` since the last release
- update `CHANGELOG.md` reflecting the above changes, release version, and release date and commit to your release branch
- make a PR from your release branch to `main` entitled `Release vX.Y.Z`
- get the release PR reviewed – all code changes should have been reviewed already, this should be a review of the integration of all changes to be shipped and the changelog

Once the release PR has been approved, merge the PR into `main`. You are now ready to make the release. Ensure you are logged in to npm and that you have access to publish the package.

- Make sure you are on the latest `master`.

- Bump the package version and push the new commit and tag:

  ```
  npm version <major|minor|patch>
  git push origin main
  git push --tags
  ```

- Publish the new version to npm:

  ```
  npm publish
  ```

Finally:

- create a release on GitHub https://github.com/bugsnag/bugsnag-source-maps/releases/new
- Use the existing tag created during the version step above
- copy the release notes from `CHANGELOG.md`
- publish the release
- update and push `next`:
  ```
  git checkout next
  git merge main
  git push
  ```
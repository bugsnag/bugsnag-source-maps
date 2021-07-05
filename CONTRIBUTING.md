# Contributing

## Testing

A full guide to testing can be found in the [testing](./TESTING.md) document

## Releases

To start a release:

- decide on a version number
- checkout the `next` branch
- review commits made to `next` since the last release
- update `CHANGELOG.md` reflecting the above changes, release version, and release date. Commit to `next`
- make a PR from `next` to `main` entitled `Release vX.Y.Z`
- get the release PR reviewed – all code changes should have been reviewed already, this should be a review of the integration of all changes to be shipped and the changelog

Once the release PR has been approved, merge the PR into `main`. You are now ready to make the release. Ensure you are logged in to npm and that you have access to publish the package.

- Bump the package version:

  ```
  npm version <major|minor|patch>
  ```

- Publish the new version to npm:

  ```
  npm publish
  ```

Finally:

- create a release on GitHub https://github.com/bugsnag/bugsnag-source-maps/releases/new
- A new tag vX.Y.Z will be created on publish
- copy the release notes from `CHANGELOG.md`
- publish the release
- update and push `next`:
  ```
  git checkout next
  git merge main
  git push
  ```
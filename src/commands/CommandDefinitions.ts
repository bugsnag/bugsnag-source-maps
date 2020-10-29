export const commonCommandDefs = [
  { name: 'api-key', type: String, description: 'your project\'s API key {bold required}' },
  { name: 'overwrite', type: Boolean, description: 'whether to replace exiting source maps uploaded with the same version' },
  { name: 'project-root', type: String, description: 'the top level directory of your project' },
  { name: 'endpoint', type: String, description: 'customize the endpoint for Bugsnag On-Premise' },
  { name: 'quiet', type: Boolean, description: 'less verbose logging' },
]
'use strict';

class OfflineEnvironmentRewrite {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options || {};
    this.hooks = {
      'before:offline:start:init': this.rewriteEnvironment.bind(this)
    };
  }

  rewriteEnvironment() {
    const environment = this.serverless.service.provider.environment;
    const replacements = this.serverless.service.custom['offline-environment-rewrite'];

    const aws_regex = /#{(AWS::([a-zA-Z]+))}/g;
    Object.keys(environment).forEach(key => {
      const value = environment[key];
      if (typeof value === 'string' && value.search(aws_regex) >= 0) {
        environment[key] = value.replace(aws_regex, function(all, _, match) {
          if (replacements.hasOwnProperty(match)) return replacements[match];
          return all; // No replacement found, don't replace
        });
      }
    });
  }
}

module.exports = OfflineEnvironmentRewrite;

#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CognitoStack } from '../lib/cognito-stack';
import { DocsStack } from '../lib/docs-stack';

const app = new cdk.App();

new CognitoStack(app, 'CognitoStack', {
  env: { region: 'ap-northeast-1' }
});

new DocsStack(app, 'DocsStack', {
  env: { region: 'ap-northeast-1' }
});

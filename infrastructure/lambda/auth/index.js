'use strict';
const outputs = require('./cognito-outputs.json');
const { Authenticator } = require('cognito-at-edge');

// 以下の各パラメータは、CDK により出力される値に置換してください
const authenticator = new Authenticator({
  region: 'ap-northeast-1', // ユーザープールのリージョン
  userPoolId: outputs.CognitoStack.UserPoolId, // CognitoStack の出力値 UserPoolId
  userPoolAppId: outputs.CognitoStack.UserPoolClientId, // CognitoStack の出力値 UserPoolClientId
  userPoolDomain: outputs.CognitoStack.UserPoolDomain, // CognitoStack の出力値 UserPoolDomain
  userPoolAppSecret: outputs.CognitoStack.UserPoolAppSecret, // 必要な場合は設定してください
});

exports.handler = async (request) => authenticator.handle(request);

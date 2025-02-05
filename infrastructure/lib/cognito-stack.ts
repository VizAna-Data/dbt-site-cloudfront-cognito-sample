import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class CognitoStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly userPoolDomain: cognito.UserPoolDomain;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Cognitoユーザープールの作成（認証用）
    this.userPool = new cognito.UserPool(this, 'DocsUserPool', {
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      passwordPolicy: {
        minLength: 16,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
    });

    // ユーザープールクライアントの作成
    const url = process.env.CLOUDFRONT_URL ? process.env.CLOUDFRONT_URL : 'https://dummy.example.com/';
    this.userPoolClient = this.userPool.addClient('DocsUserPoolClient', {
      generateSecret: false,
      oAuth: {
        callbackUrls: [url],
        defaultRedirectUri: url,
      },
    });

    // Cognitoドメインの自動作成
    this.userPoolDomain = this.userPool.addDomain('CognitoDomain', {
      cognitoDomain: {
        domainPrefix: 'my-sample-domain-for-dbt-blog-20250131'
      }
    });

    // 出力設定
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID'
    });
    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID'
    });
    new cdk.CfnOutput(this, 'UserPoolDomain', {
      value: cdk.Fn.join('', [
        this.userPoolDomain.domainName,
        '.auth.',
        cdk.Aws.REGION,
        '.amazoncognito.com'
      ]),
      description: 'Cognito User Pool Domain Name'
    });
  }
}

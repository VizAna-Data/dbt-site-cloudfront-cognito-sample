import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';


export class DocsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ------------------------------
    // S3バケットの作成（静的コンテンツ用）
    // ------------------------------
    const docsBucket = new s3.Bucket(this, 'DocsBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false
    });

    // ------------------------------
    // Lambda@Edge 関数の作成（認証チェック用）
    // ------------------------------
    const authFunction = new cloudfront.experimental.EdgeFunction(this, 'AuthFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/auth'),
      timeout: Duration.seconds(5)
    });

    // ------------------------------
    // CloudFrontディストリビューションの作成（S3バケットをオリジンとして利用）
    // ------------------------------
    const distribution = new cloudfront.Distribution(this, 'DocsDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessIdentity(docsBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        edgeLambdas: [
          {
            functionVersion: authFunction.currentVersion,
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
          }
        ]
      },
      defaultRootObject: 'index.html',
    });

    // 出力
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.domainName,
      description: 'CloudFront Distribution Domain Name',
    });

    // ADDED OUTPUT for DistributionId
    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront Distribution Id',
    });

    // ADDED OUTPUT for S3 Bucket Name
    new cdk.CfnOutput(this, 'DocsBucketName', {
      value: docsBucket.bucketName,
      description: 'S3 Bucket for hosted docs',
    });
  }
}

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";

export class StaticWebsiteStack extends cdk.NestedStack {
  bucket: s3.Bucket;
  distribution: cloudfront.CloudFrontWebDistribution;

  constructor(scope: Construct, id: string, props?:  cdk.NestedStackProps) {
    super(scope, `${id}NestedStack`)

    this.bucket = new s3.Bucket(this, `${id}Bucket`, {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
    });

    this.distribution = new cloudfront.CloudFrontWebDistribution(this, `${id}Distribution`, {
      originConfigs: [{
        s3OriginSource: {
          s3BucketSource: this.bucket,
        },
        behaviors: [{
          isDefaultBehavior: true
        }],
      }],
      errorConfigurations: [{
        errorCode: 404,
        errorCachingMinTtl: 900,
        responseCode: 200,
        responsePagePath: '/index.html' 
      }]
    });

    this.applyRemovalPolicies(props?.removalPolicy);
  }

  private applyRemovalPolicies(removalPolicy = cdk.RemovalPolicy.RETAIN) {
    this.bucket.applyRemovalPolicy(removalPolicy);
    this.distribution.applyRemovalPolicy(removalPolicy);
  }
};
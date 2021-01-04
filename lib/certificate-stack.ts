import * as cdk from "@aws-cdk/core";
import * as route53 from "@aws-cdk/aws-route53";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as ssm from "@aws-cdk/aws-ssm";

interface CertificateStackProps extends cdk.StackProps {
  hostedZone: route53.IHostedZone;
}

export class CertificateStack extends cdk.Stack {
  public readonly certificateArn: string;
  constructor(scope: cdk.Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const cert = new acm.Certificate(this, "RythmCertificate", {
      subjectAlternativeNames: ["rythm.cc"],
      domainName: "*.rythm.cc",
      validation: acm.CertificateValidation.fromDns(props.hostedZone),
    });

    new cdk.CfnOutput(this, "Rythm Certificate ARN", {
      value: cert.certificateArn,
    });

    new ssm.StringParameter(this, "RythmCertificateArnParameter", {
      parameterName: "rythm-certificate-arn",
      stringValue: cert.certificateArn,
    });

    const eastCertificate = new acm.DnsValidatedCertificate(this, "CrossRegionCertificate", {
      subjectAlternativeNames: ["rythm.cc"],
      domainName: "*.rythm.cc",
      hostedZone: props.hostedZone,
      region: "us-east-1",
    });

    new ssm.StringParameter(this, "RythmEastCertificateArnParameter", {
      parameterName: "rythm-east-certificate-arn",
      stringValue: eastCertificate.certificateArn,
    });
  }
}

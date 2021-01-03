import * as cdk from "@aws-cdk/core";
import * as route53 from "@aws-cdk/aws-route53";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as ssm from "@aws-cdk/aws-ssm";

interface CertificateStackProps extends cdk.StackProps {
  zone: route53.IHostedZone;
}

export class CertificateStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const hostedZoneId = ssm.StringParameter.valueForStringParameter(this, "rythm-hostedzoneid", 1);
    const zone = route53.HostedZone.fromHostedZoneId(this, "RythmHostedZone", hostedZoneId);

    const cert = new acm.Certificate(this, "RythmCertificate", {
      subjectAlternativeNames: ["rythm.cc"],
      domainName: "*.rythm.cc",
      validation: acm.CertificateValidation.fromDns(zone),
    });

    new cdk.CfnOutput(this, "Rythm Certificate ARN", {
      value: cert.certificateArn,
    });

    new ssm.StringParameter(this, "RythmCertificateArnParameter", {
      parameterName: "rythm-certificate-arn",
      stringValue: cert.certificateArn,
    });
  }
}

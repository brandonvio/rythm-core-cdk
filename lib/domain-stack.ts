import * as cdk from "@aws-cdk/core";
import * as route53 from "@aws-cdk/aws-route53";
import * as ssm from "@aws-cdk/aws-ssm";

export class DomainStack extends cdk.Stack {
  public readonly zone: route53.HostedZone;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    this.zone = new route53.PublicHostedZone(this, "RythmHostedZone", {
      zoneName: "rythm.cc",
    });

    new cdk.CfnOutput(this, "Rythm HostedZone Name", {
      value: this.zone.zoneName,
    });

    new ssm.StringParameter(this, "RythmHostedzoneIdParameter", {
      parameterName: "rythm-hostedzoneid",
      stringValue: this.zone.hostedZoneId,
    });

    new cdk.CfnOutput(this, "Rythm HostedZoneID", {
      value: this.zone.hostedZoneId,
    });
  }
}

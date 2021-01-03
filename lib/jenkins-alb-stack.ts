import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
import * as route53 from "@aws-cdk/aws-route53";
import * as elbtargets from "@aws-cdk/aws-elasticloadbalancingv2-targets";
import * as targets from "@aws-cdk/aws-route53-targets";
import * as ssm from "@aws-cdk/aws-ssm";

export interface JenkinsAlbStackProps extends cdk.StackProps {
  instance: ec2.Instance;
}

/**
 * https://serverfault.com/questions/558631/unable-to-access-jenkins-server
 */
export class JenkinsAlbStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: JenkinsAlbStackProps) {
    super(scope, id, props);

    const lb = elbv2.ApplicationLoadBalancer.fromLookup(this, "RythmApplicationLoadBalancer", {
      loadBalancerTags: {
        application: "rythm",
      },
    });

    const hostedZoneId = ssm.StringParameter.valueForStringParameter(this, "rythm-hostedzoneid", 1);

    const zone = route53.PublicHostedZone.fromHostedZoneAttributes(this, "hostedZone", {
      hostedZoneId: hostedZoneId,
      zoneName: "rythm.cc",
    });

    const record = new route53.ARecord(this, "RythmBuildARecord", {
      ttl: cdk.Duration.minutes(1),
      zone: zone,
      recordName: "build",
      target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(lb)),
    });

    const certificateArn = ssm.StringParameter.valueForStringParameter(
      this,
      "rythm-certificate-arn"
    );
    const certificate = elbv2.ListenerCertificate.fromArn(certificateArn);

    const listener = lb.addListener("RythmListener", {
      port: 443,
      open: true,
      certificates: [certificate],
    });

    listener.addTargets("JenkinsInstanceTarget", {
      targets: [new elbtargets.InstanceTarget(props.instance, 8080)],
      port: 8080,
      healthCheck: {
        port: "8080",
        healthyHttpCodes: "200,403",
      },
    });
  }
}

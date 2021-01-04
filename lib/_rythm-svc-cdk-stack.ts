import * as cdk from "@aws-cdk/core";
import { CertificateStack } from "./certificate-stack";
import { EcsStack } from "./ecs-stack";
import { VpcStack } from "./vpc-stack";
import { AlbStack } from "./alb-stack";
import { JenkinsStack } from "./jenkins-stack";
import { DomainStack } from "./domain-stack";
import { KeyPair } from "cdk-ec2-key-pair";
import { JenkinsAlbStack } from "./jenkins-alb-stack";
import * as ssm from "@aws-cdk/aws-ssm";

export class RythmSvcCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    cdk.Tags.of(this).add("application", "rythm");

    // Create the Key Pair
    const key = new KeyPair(this, "RythmKeyPair", {
      name: "rythm-key-pair",
      description: "key pair for rythm.",
    });

    new ssm.StringParameter(this, "RythmVpcIdParameter", {
      parameterName: "rythm-key-pair",
      stringValue: key.name,
    });

    const domainStack = new DomainStack(this, "RythmDomainStack", {
      stackName: "rythm-domain-stack",
      env: props.env,
    });

    const certificateStack = new CertificateStack(this, "CertificateStack", {
      stackName: "rythm-certificate-stack",
      env: props.env,
      hostedZone: domainStack.zone,
    });

    const vpcStack = new VpcStack(this, "RythmVpcStack", {
      stackName: "rythm-vpc-stack",
      env: props.env,
      keyName: key.name,
    });

    const ecsStack = new EcsStack(this, "RythmEcsStack", {
      stackName: "rythm-ecs-stack",
      env: props.env,
      vpc: vpcStack.vpc,
    });
    ecsStack.addDependency(vpcStack);

    const albStack = new AlbStack(this, "RythmAlbStack", {
      stackName: "rythm-alb-stack",
      vpc: vpcStack.vpc,
      env: props.env,
    });
    albStack.addDependency(vpcStack);

    const jenkinsStack = new JenkinsStack(this, "RythmJenkinsStack", {
      stackName: "rythm-jenkins-stack",
      vpc: vpcStack.vpc,
      env: props.env,
    });
    jenkinsStack.addDependency(vpcStack);

    const jenkinsAlbStack = new JenkinsAlbStack(this, "JenkinsAlbStack", {
      stackName: "rythm-jenkins-alb-stack",
      env: props.env,
      instance: jenkinsStack.jenkinsInstance,
    });
    jenkinsAlbStack.addDependency(jenkinsStack);
  }
}

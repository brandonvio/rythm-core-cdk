import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
import * as ssm from "@aws-cdk/aws-ssm";

interface AlbStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class AlbStack extends cdk.Stack {
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer;

  constructor(scope: cdk.Construct, id: string, props: AlbStackProps) {
    super(scope, id, props);

    const vpc = props.vpc;

    const securityGroup = new ec2.SecurityGroup(this, "RythmLoadbalancerSecurityGroup", {
      vpc: vpc,
      allowAllOutbound: true,
      description: "Loadbalancer security group.",
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic(), "All traffic.");

    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, "RythmApplicationLoadbalancer", {
      securityGroup: securityGroup,
      vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PUBLIC }),
      vpc: vpc,
      internetFacing: true,
    });

    new ssm.StringParameter(this, "RythmLoadbalancerArnParameter", {
      parameterName: "rythm-loadbalancer-arn",
      stringValue: this.loadBalancer.loadBalancerArn,
    });
  }
}

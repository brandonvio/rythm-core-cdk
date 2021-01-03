import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";

interface EcsStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class EcsStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster;

  constructor(scope: cdk.Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);

    // Create the ECS cluster.
    this.cluster = new ecs.Cluster(this, "RythmCluster", {
      vpc: props.vpc,
      clusterName: "rythm-cluster",
    });
  }
}

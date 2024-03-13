import { Injectable } from '@nestjs/common';
import { KAFKA_CONFIG } from '@src/core/constants';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService {
  private readonly kafkaInstance: Kafka;
  private producer: Producer;

  constructor() {
    this.kafkaInstance = new Kafka({
      clientId: KAFKA_CONFIG.clientId,
      brokers: [KAFKA_CONFIG.broker],
      connectionTimeout: KAFKA_CONFIG.connectionTimeout,
      authenticationTimeout: KAFKA_CONFIG.authenticationTimeout,
      reauthenticationThreshold: KAFKA_CONFIG.reauthenticationThreshold
    });

    this.producer = this.kafkaInstance.producer();
    this.connect();
  }

  private async connect() {
    try {
      await this.producer.connect();
    } catch (error) {
      console.error('Error connecting to Kafka:', error);
      throw new Error('Failed to connect to Kafka');
    }
  }

  async publish(message: any, kafkaTopic: string): Promise<void> {
    try {
      await this.producer.connect();
      await this.producer.send({
        topic: kafkaTopic,
        messages: [{ value: JSON.stringify(message) }]
      });
      await this.producer.disconnect();
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

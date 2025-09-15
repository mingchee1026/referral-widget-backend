import EventEmitter from "eventemitter3";
// import PQueue from "p-queue";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

export enum TransactionType {
  REGISTER = "REGISTER",
  LOGIN = "LOGIN",
  REFER = "REFER",
}

class SubscribeCliEventService {
  private eventEmitter: EventEmitter;
  private suiClient: SuiClient;

  // Concurrency-limited queue for activity events
  //   private activityQueue: PQueue;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.suiClient = new SuiClient({
      url: process.env.SUI_NETWORK || "https://fullnode.mainnet.sui.io:443",
    });

    // Allow up to 3 concurrent activity events per second
    // this.activityQueue = new PQueue({
    //   concurrency: 2,
    //   intervalCap: 5,
    //   interval: 2000,
    //   carryoverConcurrencyCount: true,
    // });

    this.initialize();
  }

  getEventEmitter() {
    return this.eventEmitter;
  }

  initialize() {
    this.eventEmitter.on("executeActivityTxn", (data) => {
      //   this.activityQueue.add(() => this.executeActivityTxn(data));
      this.executeActivityTxn(data);
    });
  }

  async executeActivityTxn(data: {
    type: TransactionType;
    isNewUser: boolean;
    custodialAddress: string;
    custodialSecretKey: string;
    custodialChainObjectId: string;
    referrerAddress: string;
    referrerChainObjectId: string;
  }) {
    const {
      type,
      isNewUser,
      custodialAddress,
      custodialSecretKey,
      custodialChainObjectId,
      referrerAddress,
      referrerChainObjectId,
    } = data;

    console.log(`Txn type: ${type}`);

    // if (type === TransactionType.REGISTER) {
    //   await this.executeRegisterTransaction(custodialAddress);
    // } else if (type === TransactionType.LOGIN) {
    //   await this.executeLoginTransaction(
    //     custodialAddress,
    //     custodialSecretKey,
    //     custodialChainObjectId
    //   );
    // } else {
    //   await this.executeReferTransaction(
    //     custodialAddress,
    //     custodialSecretKey,
    //     custodialChainObjectId,
    //     referrerAddress,
    //     referrerChainObjectId
    //   );
    // }
  }

  executeRegisterTransaction = async (allowedAddress: string) => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${process.env.PACKAGE_ADDRESS}::campaign::add_whitelist`,
      arguments: [
        tx.object(`${process.env.CAMPAIGN_OBJECT_ADDRESS}`), // campaign object address
        tx.pure.address(allowedAddress), // allowed address
        tx.pure.bool(true), // permission okay
      ],
    });

    // Serialize transaction block to base64
    let transactionBlockB64;
    try {
      transactionBlockB64 = tx.serialize();
    } catch (error) {
      return;
    }

    // const { digest } = await sendSponsorTransaction({
    //   suiClient: this.suiClient,
    //   senderAddress: process.env.ADMIN_ADDRESS || "",
    //   senderPrivateKey: process.env.ADMIN_SECRET_KEY || "",
    //   transactionBlockB64,
    //   transactionType: TransactionType.REGISTER,
    //   allowedAddress,
    // });
  };

  executeLoginTransaction = async (
    senderAddress: string,
    senderSecretKey: string,
    senderChainObjectId: string
  ) => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${process.env.PACKAGE_ADDRESS}::campaign::log_user_activity`,
      arguments: [
        tx.object(`${process.env.CAMPAIGN_OBJECT_ADDRESS}`), // campaign object address
        tx.object(`${senderChainObjectId}`), // sender whitelist object Id
        tx.object("0x6"), // Clock object address
      ],
    });

    // Serialize transaction block to base64
    // const transactionBlockB64 = tx.serialize();
    let transactionBlockB64;
    try {
      transactionBlockB64 = tx.serialize();
    } catch (error) {
      return;
    }

    // const { digest } = await sendSponsorTransaction({
    //   suiClient: this.suiClient,
    //   senderAddress,
    //   senderPrivateKey: senderSecretKey,
    //   transactionBlockB64,
    //   transactionType: TransactionType.LOGIN,
    //   allowedAddress: senderAddress,
    // });
  };

  executeReferTransaction = async (
    senderAddress: string,
    senderSecretKey: string,
    senderChainObjectId: string,
    referrerAddress: string,
    referrerChainObjectId: string
  ) => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${process.env.PACKAGE_ADDRESS}::campaign::create_referral`,
      arguments: [
        tx.object(`${process.env.CAMPAIGN_OBJECT_ADDRESS}`), // campaign object address
        tx.object(`${senderChainObjectId}`), // sender(referee) whitelist object Id
        tx.object(`${referrerChainObjectId}`), // referrer whitelist object Id
        tx.object("0x6"), // Clock object address
      ],
    });

    // Serialize transaction block to base64
    // const transactionBlockB64 = tx.serialize();
    let transactionBlockB64;
    try {
      transactionBlockB64 = tx.serialize();
    } catch (error) {
      return;
    }

    // const { digest } = await sendSponsorTransaction({
    //   suiClient: this.suiClient,
    //   senderAddress,
    //   senderPrivateKey: senderSecretKey,
    //   transactionBlockB64,
    //   transactionType: TransactionType.REFER,
    //   allowedAddress: senderAddress,
    // });
  };
}

export const subscribeCliEventService = new SubscribeCliEventService();

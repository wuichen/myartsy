"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "Conversation",
    embedded: false
  },
  {
    name: "ConversationParticipant",
    embedded: false
  },
  {
    name: "ConversationParticipantRole",
    embedded: false
  },
  {
    name: "ConversationType",
    embedded: false
  },
  {
    name: "Message",
    embedded: false
  },
  {
    name: "MessageType",
    embedded: false
  },
  {
    name: "BlockList",
    embedded: false
  },
  {
    name: "Brand",
    embedded: false
  },
  {
    name: "Category",
    embedded: false
  },
  {
    name: "Attribute",
    embedded: false
  },
  {
    name: "Option",
    embedded: false
  },
  {
    name: "OptionValue",
    embedded: false
  },
  {
    name: "SelectedOption",
    embedded: false
  },
  {
    name: "Variant",
    embedded: false
  },
  {
    name: "Product",
    embedded: false
  },
  {
    name: "Order",
    embedded: false
  },
  {
    name: "OrderLineItem",
    embedded: false
  },
  {
    name: "Shop",
    embedded: false
  },
  {
    name: "OrderableProduct",
    embedded: false
  },
  {
    name: "OrderStatus",
    embedded: false
  },
  {
    name: "User",
    embedded: false
  },
  {
    name: "UserRole",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `${process.env["PRISMA_ENDPOINT"]}`,
  secret: `${process.env["PRISMA_SECRET"]}`
});
exports.prisma = new exports.Prisma();

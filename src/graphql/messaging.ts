import { gql } from '@apollo/client';

/** Shared messaging GraphQL operations (mirrors the web messenger). */

const PARTICIPANT = `id name avatarUrl`;
const MESSAGE = `id content createdAt sender { ${PARTICIPANT} }`;
const CONVERSATION_CAR = `car { id make model year price images { thumbnailUrl url } }`;

export const GET_MY_CONVERSATIONS = gql`
  query GetMyConversations {
    getMyConversations {
      id
      unreadCount
      lastMessageAt
      ${CONVERSATION_CAR}
      buyer { ${PARTICIPANT} }
      seller { ${PARTICIPANT} }
    }
  }
`;

export const GET_CONVERSATION = gql`
  query GetConversation($id: String!) {
    getConversation(id: $id) {
      id
      unreadCount
      ${CONVERSATION_CAR}
      buyer { ${PARTICIPANT} }
      seller { ${PARTICIPANT} }
      messages { ${MESSAGE} }
    }
  }
`;

export const GET_UNREAD_MESSAGE_COUNT = gql`
  query GetUnreadMessageCount {
    getUnreadMessageCount
  }
`;

export const START_CONVERSATION = gql`
  mutation StartConversation($carId: String!, $content: String!) {
    startConversation(carId: $carId, content: $content) {
      id
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($conversationId: String!, $content: String!) {
    sendMessage(conversationId: $conversationId, content: $content) {
      ${MESSAGE}
    }
  }
`;

export const MARK_CONVERSATION_READ = gql`
  mutation MarkConversationRead($conversationId: String!) {
    markConversationRead(conversationId: $conversationId)
  }
`;

export interface MParticipant {
  id: string;
  name?: string | null;
  avatarUrl?: string | null;
}
export interface MMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: MParticipant;
}
export interface MConversation {
  id: string;
  unreadCount: number;
  lastMessageAt?: string;
  car?: {
    id: string;
    make: string;
    model: string;
    year: number;
    price?: number | null;
    images?: { thumbnailUrl?: string | null; url: string }[] | null;
  } | null;
  buyer: MParticipant;
  seller: MParticipant;
  messages?: MMessage[];
}

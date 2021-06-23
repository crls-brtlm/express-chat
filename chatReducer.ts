export type TUser = {
  id: string;
  name: string;
  status: "idle" | "writing";
};

export type TMessage = {
  id: string;
  content: string;
  sentOn: string;
  author: {
    id: string;
    name: string;
  };
};

export type TAction =
  | {
      type: "init";
    }
  | {
      type: "user_connect";
      payload: {
        user: TUser;
      };
    }
  | {
      type: "user_disconnect";
      payload: {
        user: TUser;
      };
    }
  | {
      type: "message_sent";
      payload: {
        message: TMessage;
      };
    };

export type TChatState = {
  users: TUser[];
  messages: TMessage[];
};

const initialState = {
  users: [],
  messages: [],
};

const chatReducer = (
  state: TChatState = initialState,
  action: TAction = { type: "init" }
): TChatState => {
  switch (action.type) {
    case "user_connect":
      return {
        ...state,
        users: [...state.users, action.payload.user],
      };
    case "user_disconnect":
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload.user.id),
      };
    case "message_sent":
      return {
        ...state,
        messages: [...state.messages, action.payload.message],
      };
    default:
      return state;
  }
};

export { chatReducer };

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  NetworkStatus,
} from "@apollo/client";
import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import { useMeQuery } from "./generated/graphql";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import LoginPage from "./scenes/login/login";
import Posts from "./scenes/posts/posts";
import "./styles/base.scss";
import { createUploadLink } from "apollo-upload-client";
import RegisterPage from "./scenes/register";
import SpaceXComponent from "./scenes/spacex";

declare module "apollo-upload-client";

console.info(process.env.NODE_ENV);
console.info(process.env.REACT_APP_GRAPHQL);
const client = new ApolloClient({
  link: createUploadLink({
    uri: process.env.REACT_APP_GRAPHQL,
    fetch,
    fetchOptions: { credentials: "include" },
  }),
  credentials: "include",
  uri: process.env.REACT_APP_GRAPHQL,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
});

const MainPage: React.FC = () => {
  const { data, loading, networkStatus, refetch } = useMeQuery();
  if (networkStatus === NetworkStatus.loading) {
    return <div>"Loading...."</div>;
  }
  if (networkStatus === NetworkStatus.error) {
    return (
      <div>
        <div>Network error</div>
        <Link onClick={() => refetch()} to={"/"}>
          Click here to refresh
        </Link>
      </div>
    );
  }
  if (!loading && !data?.me) {
    return (
      <div>
        <div>Please login first</div>
        <Link to={"/login"}>Go to login</Link>
      </div>
    );
  } else {
    return <Redirect to={"/posts"} />;
  }
};

const ProtectedRoute = ({ comp: Component, ...props }: any) => {
  const { data, loading } = useMeQuery();
  if (loading) return null;

  return (
    <Route
      {...props}
      render={(props) =>
        data?.me ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

const UnregisteredRoute = ({ comp: Component, ...props }: any) => {
  const { data, loading } = useMeQuery();
  if (loading) return null;
  return (
    <Route
      {...props}
      render={(props) =>
        !data?.me ? <Component {...props} /> : <Redirect to="/" />
      }
    />
  );
};

ReactDOM.render(
  <Router>
    <React.StrictMode>
      <ApolloProvider client={client}>
        <Switch>
          <Route exact path="/">
            <MainPage />
          </Route>
          <Route exact path="/login">
            <LoginPage />
          </Route>
          <Route exact path="/x">
            <SpaceXComponent />
          </Route>
          <ProtectedRoute comp={Posts} exact path="/posts" />
          <UnregisteredRoute comp={RegisterPage} exact path={"/register"} />
          {/* <Route exact path="/register">
            <RegisterPage />
          </Route> */}
          <Route path="*">
            <div>Page not found</div>
          </Route>
        </Switch>
      </ApolloProvider>
    </React.StrictMode>
  </Router>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);

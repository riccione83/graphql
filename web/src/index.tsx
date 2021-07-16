import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
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
import User from "./scenes/posts/posts";
import "./styles/base.scss";

const client = new ApolloClient({
  credentials: "include",
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});

const MainPage: React.FC = () => {
  const { data, loading } = useMeQuery();
  console.info(loading, data);
  if (!loading && !data?.me) {
    return (
      <>
        <div>Please login first</div>
        <Link to={"/login"}>Go to login</Link>
      </>
    );
  } else {
    return <Redirect to={"/posts"} />;
  }
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
          <Route exact path="/posts">
            <User />
          </Route>
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
reportWebVitals();

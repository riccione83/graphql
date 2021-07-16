import { Field, Form, Formik } from "formik";
import React from "react";
import { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import {
  useCreatePostMutation,
  useDeletePostMutation,
  useLogoutMutation,
  useMeQuery,
  usePostsQuery,
} from "../../generated/graphql";
import { updateMe } from "../../utils";
import { useAuth } from "../../utils/useAuth";
import "./styles.scss";

interface FormikValue {
  username: string;
}

const PostComponent: React.FC<{ title: string; onDelete: () => void }> = ({
  title,
  onDelete,
}) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="posts__post"
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {title}
      {hover && (
        <div className="posts__post__close" onClick={onDelete}>
          "X"
        </div>
      )}
    </div>
  );
};

const User: React.FC = () => {
  const history = useHistory();
  const [addPost] = useCreatePostMutation();
  const [deletePost] = useDeletePostMutation();
  const [logout] = useLogoutMutation();
  const { data: login, loading: userLoading } = useMeQuery();
  const { data, refetch, loading, error: loadingError } = usePostsQuery();

  useAuth();

  if (loadingError) {
    return (
      <>
        <div>Loading error!! {loadingError.message}</div>
        <Link to="/">Return to main page</Link>
      </>
    );
  }
  return (
    <div className="posts">
      {loading || userLoading ? (
        "Loading..."
      ) : (
        <div className="posts__container">
          {data?.posts?.map((post) => {
            return (
              <div key={post.id}>
                <PostComponent
                  title={post.title}
                  onDelete={() => {
                    deletePost({ variables: { id: post.id } }).then(() => {
                      refetch();
                    });
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
      <Formik
        initialValues={{
          username: "",
          password: "",
        }}
        onSubmit={async (values: FormikValue, { resetForm }) => {
          values.username !== "" &&
            login?.me?.id &&
            (await addPost({
              variables: { title: values.username },
            }).then(() => {
              refetch();
            }));
          resetForm();
        }}
      >
        {({ values, submitForm }) => {
          return (
            <Form className="posts__form">
              <div>
                <label>New post</label>{" "}
                <Field type="text" name="username"></Field>
              </div>
              <button style={{ marginTop: 16 }} type="submit">
                Submit
              </button>
            </Form>
          );
        }}
      </Formik>

      <div
        className="posts__logout"
        onClick={async () => {
          await logout({
            variables: {},
            update: updateMe,
          }).then(() => {
            history.push("/login");
          });
        }}
      >
        Logout
      </div>
    </div>
  );
};

export default User;

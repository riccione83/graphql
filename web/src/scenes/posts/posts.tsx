import { NetworkStatus, useApolloClient } from "@apollo/client";
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
  useUploadMutation,
} from "../../generated/graphql";
import { updateMe } from "../../utils";
import { useAuth } from "../../utils/useAuth";
import "./styles.scss";
import Dropzone from "react-dropzone";
interface FormikValue {
  post: string;
  file: any | null;
}

const PostComponent: React.FC<{
  title: string;
  id: number;
  imagePath?: string | null;
  onDelete: () => void;
  onUpload: (file: any) => void;
}> = ({ title, onDelete, onUpload, id, imagePath }) => {
  const [hover, setHover] = useState(false);
  const [upload] = useUploadMutation();
  return (
    <div
      className="posts__post"
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Dropzone
        onDrop={async (acceptedFiles) => {
          acceptedFiles.forEach(async (file) => {
            await upload({ variables: { id, file } }).then(() => {
              console.info("Completed, refetching");
              onUpload(file);
              return;
            });
          });
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <section>
            <div {...getRootProps()} style={{ marginBottom: 16 }}>
              <input {...getInputProps()} />
              {title}
              {imagePath && (
                <div>
                  <img src={imagePath} width={50} height={50} alt="img" />
                </div>
              )}
            </div>
          </section>
        )}
      </Dropzone>

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
  const {
    data,
    refetch,
    loading,
    error: loadingError,
    networkStatus,
  } = usePostsQuery();

  const apolloClient = useApolloClient();

  useAuth();
  const onLogout = async () => {
    await logout({
      variables: {},
      update: updateMe,
    }).then(() => {
      history.push("/login");
    });
  };

  if (networkStatus === NetworkStatus.error) {
    // network error
    return (
      <div>
        <div>Network error</div>
        <Link to="/">Click here to refresh</Link>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div>
        <div>Loading error!! </div>
        <div>{loadingError.message}</div>
        <Link to="/">Return to main page</Link>
      </div>
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
                  imagePath={post.imagePath}
                  id={post.id}
                  title={post.title}
                  onUpload={(file) => {
                    refetch();
                    apolloClient.resetStore();
                  }}
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
          file: null,
          post: "",
        }}
        onSubmit={async (values: FormikValue, { resetForm }) => {
          values.post !== "" &&
            login?.me?.id &&
            (await addPost({
              variables: { title: values.post, file: values.file },
            }).then(() => {
              refetch();
            }));
          resetForm();
        }}
      >
        {({ values, submitForm, setFieldValue }) => {
          return (
            <Form className="posts__form">
              <div>
                <label>New post</label>
                <Field type="text" name="post"></Field>
              </div>
              {values.file && (
                <div>
                  <img
                    src={URL.createObjectURL(values.file)}
                    alt="file"
                    width={50}
                    height={50}
                  />
                </div>
              )}
              <Dropzone
                onDrop={(acceptedFiles) => {
                  setFieldValue("file", acceptedFiles[0]);
                }}
              >
                {({ getRootProps, getInputProps }) => (
                  <section>
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <p>
                        Drag 'n' drop some files here, or click to select files
                      </p>
                    </div>
                  </section>
                )}
              </Dropzone>
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
          onLogout();
        }}
      >
        Logout
      </div>
    </div>
  );
};

export default User;

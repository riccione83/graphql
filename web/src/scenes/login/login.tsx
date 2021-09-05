import Spin from "antd/lib/spin";
import { Field, Form, Formik } from "formik";
import React from "react";
import { useHistory } from "react-router-dom";
import { FieldError, useLoginMutation } from "../../generated/graphql";
import { updateMe } from "../../utils";
import "./styles.scss";

interface FormikValue {
  username: string;
  password: string;
}

export const toErrorMap = (errors: FieldError[]) => {
  const errorMap: Record<string, string> = {};
  errors.forEach(({ field, message }) => {
    errorMap[field] = message;
  });

  return errorMap;
};

const LoginPage: React.FC = () => {
  const [login, { loading }] = useLoginMutation();
  const history = useHistory();

  return (
    <div className="login">
      <Formik
        initialValues={{
          username: "",
          password: "",
        }}
        onSubmit={async (values: FormikValue, { resetForm, setErrors }) => {
          const response = await login({
            variables: { ...values },
            update: updateMe,
          });
          console.info(response);
          if (response.data?.login.errors) {
            setErrors({ password: response.data?.login.errors[0].message });
          } else if (response.data?.login.user) {
            history.push("/posts");
          }
        }}
      >
        {({ values, submitForm, errors }) => {
          if (loading) return <Spin tip="Loading..." />;
          return (
            <Form className="login__form">
              <div className="login__field">
                <label>Username</label>
                <Field type="text" name="username"></Field>
              </div>
              <div className="login__field">
                <label>Password</label>
                <Field type="text" name="password"></Field>
              </div>
              {errors && <div>{errors.password}</div>}
              <button className="login__submit" type="submit">
                Submit
              </button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default LoginPage;

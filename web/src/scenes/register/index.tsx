import { Field, Form, Formik } from "formik";
import React from "react";
import { useHistory } from "react-router-dom";
import { useRegisterMutation } from "../../generated/graphql";
import { updateMe } from "../../utils";
import "./styles.scss";

interface FormikValue {
  username: string;
  password: string;
}

const RegisterPage: React.FC = () => {
  const [register] = useRegisterMutation();
  const history = useHistory();

  return (
    <div className="register">
      <Formik
        initialValues={{
          username: "",
          password: "",
        }}
        onSubmit={async (values: FormikValue, { resetForm, setErrors }) => {
          const response = await register({
            variables: { ...values },
            update: updateMe,
          });
          console.info(response);
          if (response.data?.register.id) {
            history.push("/login");
          }
        }}
      >
        {({ values, submitForm, errors }) => {
          return (
            <Form className="register__form">
              <div className="register__title">Register here!</div>
              <div className="register__field">
                <label>Username</label>
                <Field type="text" name="username"></Field>
              </div>
              <div className="register__field">
                <label>Password</label>
                <Field type="text" name="password"></Field>
              </div>
              {errors && <div>{errors.password}</div>}
              <button className="register__submit" type="submit">
                Register
              </button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default RegisterPage;

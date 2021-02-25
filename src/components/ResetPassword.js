import React, { useRef } from "react";
import "../css/UserAdmisson.css";
import { MdEmail, MdLock } from "react-icons/md";
import { BiErrorCircle } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { resetPassword } from "../service/auth";

const ResetPassword = (props) => {
  const { register, errors, handleSubmit, watch } = useForm({
    criteriaMode: "all",
  });

  const onSubmit = (data) => {
    const query = props.location.search;
    const { password, confirmPassword } = data;
    if (password && password !== confirmPassword) return;
    return resetPassword({ query, password });
  };

  const password = useRef({});
  password.current = watch("password", "");

  return (
    <div id="reset-password" className="user-admisson">
      <h1 className="form-title blue-color">Reset Password</h1>
      <p className="yellow-color">Reset your password here</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input-container">
          <input
            type="password"
            name="password"
            defaultValue="password1"
            placeholder="New Password"
            ref={register({
              required: "This is required",
              minLength: {
                value: 6,
                message: "Password must have at least 6 characters",
              },
              maxLength: {
                value: 20,
                message: "Password must have less than 20 characters",
              },
            })}
          />
          <MdLock className="input-icon" />
          <ErrorMessage
            errors={errors}
            name="password"
            render={({ messages }) =>
              messages &&
              Object.entries(messages).map(([type, message]) => (
                <div className="error-container">
                  <BiErrorCircle className="error-icon" />
                  <p key={type} className="error-message">
                    {message}
                  </p>
                </div>
              ))
            }
          />
        </div>
        <div className="input-container">
          <input
            type="password"
            name="confirmPassword"
            defaultValue="password1"
            placeholder="Confirm New Password"
            ref={register({
              required: "This is required",
              validate: (value) =>
                value === password.current || "The password does not match",
            })}
          />
          <MdLock className="input-icon" />
          <ErrorMessage
            errors={errors}
            name="confirmPassword"
            defaultValue="password1"
            render={({ messages }) =>
              messages &&
              Object.entries(messages).map(([type, message]) => (
                <div className="error-container">
                  <BiErrorCircle className="error-icon" />
                  <p key={type} className="error-message">
                    {message}
                  </p>
                </div>
              ))
            }
          />
        </div>
        <div className="mt-50">
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;

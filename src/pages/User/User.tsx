import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./User.css";

type propsInterface = {
  userId: string | undefined;
}

const PageContent = (props: propsInterface) => {

  const { userId } = props;

  const [userProfile] = useState({}); //, setUserProfile

  useEffect(() => {
    if (userId) {
      // go fetch the users list.
      console.log(` -> Go fetch the list for ${userId}`, userProfile);
    };
  }, [userId]);

  return (
    <>
      <section>
        <h2>This is the User page - view other peoples lists.</h2>
      </section>
    </>
  );
};

const Symbol = () => {
  let { userId } = useParams();
  return <PageContent userId={userId} />;
};

export default Symbol;

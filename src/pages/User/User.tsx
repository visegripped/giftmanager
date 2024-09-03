import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './User.css';

type propsInterface = {
  userid: string | undefined;
};

const PageContent = (props: propsInterface) => {
  const { userid } = props;

  const [userProfile] = useState({}); //, setUserProfile

  useEffect(() => {
    if (userid) {
      // go fetch the users list.
      console.log(` -> Go fetch the list for ${userid}`, userProfile);
    }
  }, [userid]);

  return (
    <>
      <section>
        <h2>This is the User page - view other peoples lists.</h2>
      </section>
    </>
  );
};

const Symbol = () => {
  let { userid } = useParams();
  return <PageContent userid={userid} />;
};

export default Symbol;

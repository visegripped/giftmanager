import { useState, useEffect } from 'react';
import Button from '@components/Button';
import './Me.css';

type propsInterface = {
  myId: string | undefined;
};

const Me = (props: propsInterface) => {
  const { myId } = props;

  const [userProfile] = useState({}); //, setUserProfile

  useEffect(() => {
    if (myId) {
      // go fetch the users list.
      console.log(` -> Go fetch the list for ${myId}`, userProfile);
    }
  }, [myId]);

  return (
    <>
      <section>
        <h2>This is the Me page - view other peoples lists.</h2>
      </section>
    </>
  );
};

export default Me;

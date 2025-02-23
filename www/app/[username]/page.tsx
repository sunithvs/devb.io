import React, { use } from "react";

const Page = ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = use(params);
  return <div>

  </div>;
};
export default Page;

import React, {Suspense} from 'react';

const Layout = ({children}: {children: React.ReactNode}) => {
    return (
        <Suspense fallback={null}>
            {children}
        </Suspense>
    );
};

export default Layout;

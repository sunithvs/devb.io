interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`max-w-[1136px] mx-auto ${className} md:max-lg:px-4`}>
      {children}
    </div>
  );
}

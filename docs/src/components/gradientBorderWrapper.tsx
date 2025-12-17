import React, { FC, ReactElement } from 'react'

interface GradientBorderWrapperProps {
  style?: React.CSSProperties
  children: React.ReactNode
}

const GradientBorderWrapper: FC<GradientBorderWrapperProps> = ({
  children,
  style,
}): ReactElement => {
  return (
    <div
      style={{
        borderRadius: '6px',
        ...style,
      }}
      className={`h-fit w-fit p-[1px] bg-gradient-to-tr from-[#25FF79] via-[#1BC759] to-[#25FF79]  `}
    >
      {children}
    </div>
  )
}

export default GradientBorderWrapper
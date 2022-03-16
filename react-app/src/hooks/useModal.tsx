import React, { useState } from "react";

export const useModal = () => {
  const [Child, setElement] = useState<(React.ComponentType<any> | undefined)>();
  const modal = (el?: React.ComponentType<any>) => setElement(el);

  const ModalContainer = (props: any) => {
    if (!Child) {
      return;
    }

    return (
      <div>
        <Child />
      </div>
    );
  }

  return [ModalContainer, modal]
}

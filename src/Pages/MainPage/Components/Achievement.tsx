import { Modal, message } from "antd";

export default function Achievement(props: any) {
  const [messageApi, contextHolder] = message.useMessage();
  return (
    <>
      {contextHolder}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p className="achievement--name">{props.name}</p>
        <img
          style={{
            filter: props.locked ? "grayscale(70%)" : "grayscale(0%)",
          }}
          className="achievement--img"
          src={props.img}
          alt={props.name}
          onClick={() => {
            props.locked
              ? messageApi.error("Достижение заблокировано")
              : Modal.success({
                  title: props.name,
                  content: props.description,
                  styles: {
                    mask: {
                      backdropFilter: "blur(5px)",
                    },
                  },
                });
          }}
        />
      </div>
    </>
  );
}

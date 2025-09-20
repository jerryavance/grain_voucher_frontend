import { Badge, Calendar, Popover, theme, Tooltip } from "antd";
import styled from "styled-components";
const onPanelChange = (value: any, mode: any) => {
  console.log(value.format("YYYY-MM-DD"), mode);
};
export const CalendarView = () => {
  const { token } = theme.useToken();
  const wrapperStyle = {
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
  };

  const getListData = (value: any) => {
    const date = value.format("YYYY-MM-DD");
    const events = {
      "2024-12-10": [{ type: "success", content: "Special Event" }],
      "2024-12-15": [{ type: "warning", content: "Holiday" }],
      "2024-12-25": [{ type: "error", content: "Christmas" }],
    };
    return events?.[date as keyof typeof events] || [];
  };

  const dateCellRender = (value: any) => {
    const listData = getListData(value);
    return (
      <>
        {listData.map((item: any, index: any) => (
          <Popover
            placement="topLeft"
            title={item.content}
            content={item.content}
          >
            <div
              className="flexCenter mainBg1"
              style={{
                height: 5,
                padding: 10,
                position: "absolute",
                top: 17,
              }}
            >
              <Badge status={item.type} key={index} style={{}} />
            </div>
          </Popover>
        ))}
      </>
    );
  };

  return (
    <Wrapper style={wrapperStyle} className="smallCalendar">
      <Calendar
        fullscreen={false}
        onPanelChange={onPanelChange}
        dateCellRender={dateCellRender}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 285px;
  @media (max-width: 1280px) {
    width: 250px;
  }
  @media (max-width: 960px) {
    width: 100%;
  }
`;

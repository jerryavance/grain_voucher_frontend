import styled from "styled-components";
import {
  Farmer1,
  Farmer2,
  Farmer3,
} from "../../assets/svg/SvgIcons";
// import Slider from "react-slick";

const settings = {
  // fade: true,
  autoplay: true,
  speed: 1000,
  pauseOnHover: false,
  autoplaySpeed: 6000,
  slidesToShow: 1,
  arrows: false,
  dots: true,
};

function InfoTile({ data }: any) {
  const { title, desc, image, width } = data;
  return (
    <Wrapper className="whiteColor flexCenter flexColumn textCenter gap20">
      <SliderImg src={image} alt="image" width={width} />

      <div className="flexCenter flexColumn gap20" style={{ maxWidth: 500 }}>
        <h2>{title}</h2>
        <div className="font13">{desc}</div>
      </div>
    </Wrapper>
  );
}

const infoData = [
  {
    image: Farmer1,
    title: "Manage Your Grain Vouchers",
    desc: (
      <p> 
        Easily manage your grain vouchers in a single, secure digital wallet. 
        Send and receive vouchers, track their value, and make transactions directly from your phone.
        <br />
        <br />
      </p>
    ),
  },
  {
    image: Farmer2,
    title: "Grain Trading Made Easy",
    desc: (
      <p>
        Gain real-time market insights and get the best price for your harvest. 
        Our platform helps you make smart trading decisions and connect with potential buyers.
      </p>
    ),
  },
  {
    image: Farmer3,
    title: "Secure Your Harvest",
    desc: (
      <p>
        Protect your harvested grain with our secure storage solution. 
        Track your inventory, receive tamper-proof vouchers, and access your assets' value anytime.
      </p>
    ),
  },
];

export default function InfoSlider() {
  return (
    <>
      {/* Slider */}
      <div
        data-aos="fade-up"
        data-aos-duration="1500"
        style={{ height: "100%" }}
      >
        {/* <Slider {...settings}>
          {infoData.map((val, key) => {
            return <InfoTile data={val} key={key} />;
          })}
        </Slider> */}
      </div>
    </>
  );
}

const Wrapper = styled.div`
  width: 100%;
  min-height: 600px;
  padding: 40px;
`;

const SliderImg = styled.img`
  width: ${(props) => (props.width ? props.width : "350px")};
  marginbottom: 20px;
  @media (max-width: 760px) {
    width: ${(props) => (props.width ? props.width : "100%")};
  }
`;

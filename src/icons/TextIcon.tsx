// function TextIcon(): React.ReactElement {
//   return (
//     <svg
//       version="1.1"
//       xmlns="http://www.w3.org/2000/svg"
//       x="0px"
//       y="0px"
//       viewBox="0 0 362 362"
//       style={{ width: '18px', height: '18px' }}
//     >
//       <path
//         d="M351.7,4.501H10.3c-5.6-0.1-10.2,4.4-10.3,9.9v59.9c0,5.5,4.5,10,10,10s10-4.5,10-10v-49.8h151v313h-66.9
// 			c-5.5,0-10,4.5-10,10s4.5,10,10,10h153.7c5.5,0,10-4.5,10-10s-4.5-10-10-10H191v-313h151v49.9c0,5.5,4.5,10,10,10s10-4.5,10-10
// 			v-59.9C361.8,8.901,357.2,4.401,351.7,4.501z"
//       />
//     </svg>
//   );
// }
interface IconProps {
  className?: string;
  onClick?: (e?: React.MouseEvent<HTMLImageElement, MouseEvent>) => void;
}

function TextIcon(props: IconProps): React.ReactElement {
  const { className, onClick } = props;
  return (
    <img
      className={className}
      onClick={onClick}
      src="https://img.icons8.com/small/344/text.png"
      style={{ width: '18px', height: '18px' }}
    />
  );
}

export default TextIcon;

import React from 'react';
import './App.scss';
import LabeledInput from './ui/components/LabeledInput';
import NavBar from './ui/components/NavBar';

function SideBar(): React.ReactElement {
  return (
    <div className="sidebar__container">
      <div className="sidebar">
        <div className="menu">Document structure</div>
      </div>
    </div>
  );
}

function App(): React.ReactElement {
  return (
    <>
      <NavBar />

      <div className="main">
        <div className="page">
          <SideBar />

          <div className="builder-main">
            <p>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fuga aliquam maxime facilis iste tenetur vitae
              culpa vel deleniti error similique distinctio quod eius suscipit autem atque saepe dolor necessitatibus
              eveniet, neque fugiat est. Pariatur ratione molestiae minima dolor corrupti tempore. Eum, alias.
              Cupiditate rerum nisi voluptatem officiis magni voluptas tenetur reprehenderit pariatur eveniet, incidunt
              dicta corrupti nihil ut, iusto totam, maiores tempore modi veniam. Ex id, est voluptates expedita quasi
              ipsam modi aliquid voluptas quidem molestias debitis ut ipsum, dolorem perferendis, velit nostrum
              consequatur tempora consectetur temporibus voluptate. Blanditiis repellendus ab alias reprehenderit, magni
              debitis tempore minima vitae illo ea quis quod molestias mollitia. Reprehenderit saepe officia voluptas,
              asperiores cupiditate fugit officiis ducimus est minima, ipsa sapiente nobis ad unde illo dicta? Ipsa
              ratione molestiae ad a beatae. Dolorum, placeat neque! Nobis quis itaque aliquid reprehenderit aperiam,
              molestiae nisi vitae harum, eos eum ipsa aspernatur repellendus autem deserunt, dolorum error. Porro nisi
              fugit nemo tempora numquam dignissimos harum nihil dolore, corporis quisquam quo rem ipsum molestiae.
              Perspiciatis, aut minima enim quam, voluptatibus illum natus possimus nesciunt necessitatibus a impedit
              praesentium quo numquam rem, aperiam facilis ducimus sequi dignissimos quod ratione cumque! Possimus quos
              impedit nihil repellat aut incidunt perferendis quo recusandae doloribus minus, fuga ipsum maxime odit.
              Tempora iure dignissimos esse voluptate reprehenderit ipsam quas, eos deleniti fugit. Beatae saepe fugit
              sint velit placeat.
            </p>
          </div>

          <div className="builder-controls">
            <div className="controls-section">
              <div className="controls-section__row">
                <LabeledInput label="X" />

                <div className="controls-section__separator">A</div>

                <LabeledInput label="Y" />
              </div>

              <div className="controls-section__row">
                <LabeledInput label="W" />

                <div className="controls-section__separator">A</div>

                <LabeledInput label="H" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

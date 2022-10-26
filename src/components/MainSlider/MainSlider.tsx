const MainSlider = () => {
    return (
        <div className="main-slider-container">
            <div className="pseudo-div have-selection">
                <div className="select-section">
                    <div className="selected-value"></div>
                    <div className="options-container"></div>
                </div>

                <div className="upper-content-pseudo"></div>
                <div className="bottom-content-pseudo"></div>
            </div>
            <div className='main-slider'>
                <div className="bottom-slider">
                    <div className="event-wrapper" style={{ position: 'absolute', top: -50 }}></div>
                    <div className="label-wrapper">
                    </div>
                </div>
                <div className="upper-slider">
                    <div className='line-wrapper'>
                    </div>
                </div>


                <div className="timeline-range-wrapper">
                </div>
            </div >
            <div className="pseudo-div have-selection">
                <div className="bottom-content-pseudo"></div>
                <div className="upper-content-pseudo"></div>

            </div>
        </div>
    )
}

export default MainSlider
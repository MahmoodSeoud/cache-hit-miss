import { Button } from "primereact/button";
import { useState } from "react";
import { ColorResult, HuePicker } from "react-color";
import { createRandomNumberWith } from "../../Utils";

interface BitAddressHeaderProps {
    addressBitWidth: number;
    addressInBits: string;
}


function BitAddressHeader({addressBitWidth, addressInBits}: BitAddressHeaderProps) {
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [color, setColor] = useState<string>("#" + createRandomNumberWith(4 * 6).toString(16));
    /**
    * Handles the mouse enter event on an element.
    *
    * @param {React.MouseEvent} e - The mouse event object.
    */
    function handleMouseDown(e: React.MouseEvent) {
        setIsMouseDown(true);
        const pTagWithIndex = e.currentTarget as HTMLElement;
        const isHighligted = pTagWithIndex.classList.contains('highlight');

        if (isHighligted) {
            pTagWithIndex.classList.remove('highlight');
            // Setting the color the the one selected in the color picker
            pTagWithIndex.style.backgroundColor = "";
        } else {

            // Apply highlight to the current div
            pTagWithIndex.classList.add('highlight');
            // Setting the color the the one selected in the color picker
            pTagWithIndex.style.backgroundColor = color;

        }
    }

    /**
   
  * Handles the mouse enter event on an element.
  *
  * @param {React.MouseEvent} e - The mouse event object.
  */
    function handleMouseEnter(e: React.MouseEvent) {
        if (isMouseDown) {
            // Apply highlight to the current div
            const pTagWithIndex = e.currentTarget as HTMLElement;
            pTagWithIndex.classList.add('highlight');

            // Setting the color the the one selected in the color picker
            pTagWithIndex.style.backgroundColor = color;
        }
    };


    /**
     * Handles the mouse up event.
     */
    function handleMouseUp() {
        setIsMouseDown(false);
    };
    /**
   * Handles changes in color selection.
   *
   * @param {ColorResult} color - The new color selected by the user.
   */
    function handleColorChange(color: ColorResult): void {
        setColor(color.hex)
    }


    /**
  * Resets the colors of all highlighted elements to their initial state.
  */
    function resetColors(): void {
        const bitElements = document.getElementsByClassName('input-text') as HTMLCollectionOf<HTMLElement>;
        const textElements = document.getElementsByClassName('exercise-label') as HTMLCollectionOf<HTMLElement>;

        for (let i = 0; i < bitElements.length; i++) {
            const isHighligted = bitElements && bitElements[i] && bitElements[i].classList.contains('highlight');

            if (isHighligted) {
                bitElements[i].classList.remove('highlight');
                bitElements[i].style.backgroundColor = '';
            }
        }

        for (let i = 0; i < bitElements.length; i++) {
            const isHighligted = textElements && textElements[i] && textElements[i].classList.contains('highlight');

            if (isHighligted) {
                textElements[i].classList.remove('highlight');
                textElements[i].style.backgroundColor = '';
            }
        }
    }



    /**
   * Creates an array of nulls with a specified length.
   *
   * @param {number} addressWidth - The length of the array to create.
   * @returns {Array<null>} - An array of nulls with the specified length.
   */
    function createNullArr(addressWidth: number): Array<null> {
        return Array(addressWidth).fill(null);
    }

    return (
        <div className='input-header'>
            <div className="input-buttons">

                <Button
                    severity='danger'
                    onClick={resetColors}
                    style={{ margin: '1rem' }}
                >
                    Reset the colors
                </Button>

            </div>
            <HuePicker
                width={'200px'}
                color={color}
                onChange={handleColorChange}
            />
            <h4>Click and drag to highlight bits or labels <br /> </h4>
            <div className={`list-item-bit-input-wrapper `}>
                {createNullArr(addressBitWidth).map((_, index) => (
                    <div
                        key={index}
                        className='input-wrapper'
                        onMouseUp={handleMouseUp}
                    // TODO: Maybe change the coloring to appear when clicking on this div aswell
                    >
                        <p
                            id='vbit-index'
                            className="input-text"
                            onMouseDown={handleMouseDown}
                            onMouseEnter={handleMouseEnter}
                        >
                            {addressBitWidth - index - 1}
                        </p>
                        <div
                            id='vbit'
                            autoFocus={false}
                            autoCapitalize='off'
                            className={'vbit-input'}
                        >
                            {addressInBits[index]}
                        </div>
                    </div>
                ))}
            </div>
        </div>

    );
}

export default BitAddressHeader;
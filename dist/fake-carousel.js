class FakeCarousel {
  constructor(props) {
    //constants
    this.modeDefault = "default";
    this.modeDragFree = "drag";
    this.wrapperClassName = "carousel-wrapper";
    this.viewportClassName = "carousel-viewport";
    this.itemClassName = "carousel-item"; //variables

    this.currentItemAxis = 0;
    this.lastFocusAxis = 0;
    this.mouseActiveAxis = 0;
    this.mouseMoveToAxis = 0;
    this.mouseMovedLength = 0;
    this.isMouseEnter = false;
    this.isScrolling = false; //options

    this.elementId = props.id || '';
    this.mode = props.mode || "default";
    this.carouselPageSize = props.carouselPageSize || 4;
    this.spaceItems = props.spaceItems || 8;
    this.animateDuration = props.animateDuration || 500;
    this.currentPage = props.currentPage || 0; //todo options

    this.loop = false;
    this.dragAble = false;
    this.dragFree = false; //first init

    this.init();
  } // init method


  init() {
    //init layout
    this.$eleRoot = document.querySelector(`#${this.elementId}`);

    this._initViewPort();

    this._getPageLength();

    this._getStaticWidth(); //init events


    this._initMouseEvents();

    window.addEventListener("resize", this._reCalculate);
  } //destroy


  destroy() {
    this.$eleRoot.remove();
    window.removeEventListener("resize", this._reCalculate);
  } // actions


  next() {
    if (this.currentPage < this.carouselPageLength - 1 && !this.isScrolling) {
      this.currentPage += 1;

      this._handleScrollDefault();
    }
  }

  previous() {
    if (this.currentPage > 0 && !this.isScrolling) {
      this.currentPage -= 1;

      this._handleScrollDefault();
    }
  }

  _initViewPort() {
    //create wrapper element and viewport element
    this.$eleWrapper = this._createElement("div", [this.wrapperClassName]);
    this.$eleViewport = this._createElement("div", [this.viewportClassName]);
    this.$eleViewport.style.marginLeft = `-${this.spaceItems}px`; //create carousel items

    for (let i = 0; i < this.$eleRoot.children.length; i++) {
      const wrapperItem = this._createElement("div", [this.itemClassName]);

      const cloneItem = this.$eleRoot.children[i].cloneNode(true);
      wrapperItem.appendChild(cloneItem);
      this.$eleViewport.appendChild(wrapperItem);
    }

    this.$eleWrapper.appendChild(this.$eleViewport);
    this.$eleRoot.innerHTML = "";
    this.$eleRoot.appendChild(this.$eleWrapper); //calculate width for carousel items

    const minWidth = 100 / this.carouselPageSize;
    this.$eleItems = document.querySelectorAll(`.${this.itemClassName}`);
    this.$eleItems.forEach(carouselItem => {
      carouselItem.style.minWidth = `${minWidth}%`;
      carouselItem.style.paddingLeft = `${this.spaceItems}px`;
    });
  }

  _reCalculate = () => {
    this._getStaticWidth();
  };

  _initMouseEvents() {
    this.$eleWrapper.addEventListener("mousedown", e => this._activeMouseScroll(e));
    document.querySelector("body").addEventListener("mouseup", () => {
      if (this.isMouseEnter) {
        this._deActiveMouseScroll();
      }
    });
  }

  _getStaticWidth() {
    //calculate width
    this.wrapperOuterWidth = this.$eleWrapper.clientWidth + this.spaceItems;
    this.minStopAxis = this.stopSpaceAxis = 0.3 * this.wrapperOuterWidth;
    this.maxStopAxis = -((this.carouselPageLength - 1) * this.wrapperOuterWidth);
  }

  _getPageLength() {
    this.carouselPageLength = Math.ceil(this.$eleItems.length / this.carouselPageSize);
    this.isFully = this._trackFullyCarousel();
  }

  _trackFullyCarousel() {
    const a = this.$eleItems.length / this.carouselPageSize;
    const b = this.carouselPageLength - a;
    return b === 0;
  } // calculate axis for mouse events


  _calcScroll(e) {
    if (!this.isScrolling) {
      this.mouseMoveToAxis = e.x;
      this.mouseMovedLength = this.mouseMoveToAxis - this.mouseActiveAxis;
      this.lastFocusAxis = this._checkoutSide(this.mouseMovedLength + this.currentItemAxis);

      this._handingScroll({
        axisX: this.lastFocusAxis
      });
    }
  }

  _activeMouseScroll(e) {
    this.isMouseEnter = true;
    this.mouseMovedLength = 0;
    this.mouseActiveAxis = e.x;
    this.$eleViewport.addEventListener("mousemove", this._handleMouseMoveEvent);
  }

  _deActiveMouseScroll() {
    this.isMouseEnter = false;
    this.$eleViewport.removeEventListener("mousemove", this._handleMouseMoveEvent); //handle auto scroll

    this._autoScroll();
  }

  _handleMouseMoveEvent = e => {
    this._calcScroll(e);
  };

  _handleScrollDefault() {
    this.isScrolling = true;
    this.currentItemAxis = -(this.currentPage * this.wrapperOuterWidth);

    this._addAnimate();

    this._handingScroll({
      axisX: this.currentItemAxis
    });

    this._removeAnimate();
  } // auto scroll


  _autoScroll() {
    if (this.mouseMovedLength !== 0 && this.lastFocusAxis <= 0) {
      const lastPage = this.isFully ? this.lastFocusAxis <= this.maxStopAxis - this.stopSpaceAxis : this.lastFocusAxis <= this.maxStopAxis;

      if (!lastPage) {
        const mouseMovePercent = Math.abs(this.mouseMovedLength / this.$eleWrapper.clientWidth) * 100;

        if (mouseMovePercent > 30) {
          this.currentPage += this.mouseMovedLength > 0 ? -1 : 1;

          this._handleScrollDefault();
        } else {
          this._handleScrollDefault();
        }
      } else if (this.isFully) {
        this._handleScrollDefault();
      }
    } else {
      this._handleScrollDefault();
    }
  } //outside


  _checkoutSide(axis) {
    if (axis >= this.minStopAxis) {
      return this.minStopAxis;
    }

    if (this.isFully && axis <= this.maxStopAxis - this.stopSpaceAxis) {
      return this.maxStopAxis - this.stopSpaceAxis;
    } else if (!this.isFully && axis <= this.maxStopAxis) {
      return this.maxStopAxis;
    }

    return axis;
  } // animate handle


  _addAnimate(duration = this.animateDuration) {
    this.$eleViewport.style.transition = `transform ${duration}ms `;
  } //


  _removeAnimate() {
    window.setTimeout(() => {
      this.$eleViewport.style.transition = ``;
      this.isScrolling = false;
    }, [this.animateDuration]);
  } // set transform


  _handingScroll({
    axisX = 0,
    axisY = 0
  }) {
    this.$eleViewport.style.transform = `translate3d(${axisX}px,${axisY},0)`;
  } //


  _createElement(tagName = "div", classesName = []) {
    const ele = document.createElement(tagName);
    classesName.map(className => {
      ele.classList.add(className);
    });
    return ele;
  }

}

export { FakeCarousel as default };

(function ($) {
  $.fn.mauGallery = function (options) {
    var options = $.extend({}, $.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function () {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function (index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };
  $.fn.mauGallery.listeners = function (options) {
    $(".gallery-item").on("click", function () {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };
  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("data-full") || element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },


    /** CORRECTION DEFILEMENT IMAGES MODALE */
    /** IMAGES PRECEDENTES */
    prevImage() {
      const currentSrc = $(".lightboxImage").attr("src");
      const activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      const imagesCollection = [];

      // Construire la collection d'images visibles selon le filtre
      if (activeTag === "all") {
        $(".item-column:visible img.gallery-item").each(function () {
          imagesCollection.push($(this));
        });
      } else {
        $(".item-column:visible img.gallery-item").each(function () {
          if ($(this).data("gallery-tag") === activeTag) {
            imagesCollection.push($(this));
          }
        });
      }

      let index = imagesCollection.findIndex(img => img.attr("src") === currentSrc);

      if (index === -1) {
        index = 0;
      }
      const prevIndex = (index - 1 + imagesCollection.length) % imagesCollection.length;

      // Mettre à jour l'image dans la modale
      $(".lightboxImage").attr("src", imagesCollection[prevIndex].attr("src"));
    },

    /** IMAGES SUIVANTES */
    nextImage() {
      const currentSrc = $(".lightboxImage").attr("src");
      const activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      const imagesCollection = [];

      // Construire la collection d'images visibles selon le filtre
      if (activeTag === "all") {
        $(".item-column:visible img.gallery-item").each(function () {
          imagesCollection.push($(this));
        });
      } else {
        $(".item-column:visible img.gallery-item").each(function () {
          if ($(this).data("gallery-tag") === activeTag) {
            imagesCollection.push($(this));
          }
        });
      }

      // Trouver l'index de l'image active dans la collection
      let index = imagesCollection.findIndex(img => img.attr("src") === currentSrc);

      if (index === -1) {
        index = 0;
      }
      const nextIndex = (index + 1) % imagesCollection.length;

      // Mettre à jour l'image dans la modale
      $(".lightboxImage").attr("src", imagesCollection[nextIndex].attr("src"));
    },

    /** CREATION FENETRE MODALE */
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"
        }" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${navigation
          ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
          : '<span style="display:none;" />'
        }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${navigation
          ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
          : '<span style="display:none;" />'
        }
                        </div>
                    </div>
                </div>
            </div>`);
    },

    /** FILTRES GALERIE */
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function (index, value) {
        tagItems += `<li class="nav-item">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }

      $(".tags-bar .nav-link").removeClass("active active-tag");
      $(this).addClass("active active-tag");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function () {
        const column = $(this).parents(".item-column");
        column.hide();
        if (tag === "all" || $(this).data("gallery-tag") === tag) {
          column.show(300);
        }
      });
    }
  };
})(jQuery);

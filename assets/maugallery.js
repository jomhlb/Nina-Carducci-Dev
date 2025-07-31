/** CREATION GALERIE PERSONNALISE */
(function ($) {
  $.fn.mauGallery = function (options) {
    var options = $.extend({}, $.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function () {

      /** Création de la structure */
      $.fn.mauGallery.methods.createRowWrapper($(this));

      /** Ajout du lightbox si activé */
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      /** Traitement de chaque image */
      $(this)
        .children(".gallery-item")
        .each(function (index) {

          /** Rendre les images fluides */
          $.fn.mauGallery.methods.responsiveImageItem($(this));

          /** Déplacement dans le wrapper */
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));

          /** Placer l'image dans une colonne responsive */
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);

          /** Collecte des tags pour les filtres */
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      /** Affichage des tags pour filtrer (si activé) */
      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      /** Affichage progressif */
      $(this).fadeIn(500);
    });
  };

  /** Options par défaut */
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };
  $.fn.mauGallery.listeners = function (options) {

    /** Clic sur une image */
    $(".gallery-item").on("click", function () {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    /** Clic sur les filtres par tags */
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);

    /** Navigation dans la lightbox */
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };

  /** Organiser les colonnes des images à l’intérieur */
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

    /** Taille des images par rapport à la taille de l’écran */
    wrapItemInColumn(element, columns) {
      if (typeof columns === "number") {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (typeof columns === "object") {
        const breakpoints = ["xs", "sm", "md", "lg", "xl"];
        let columnClasses = "";

        breakpoints.forEach(bp => {
          if (columns[bp]) {
            const prefix = bp === "xs" ? "col" : `col-${bp}`;
            columnClasses += ` ${prefix}-${Math.ceil(12 / columns[bp])}`;
          }
        });

        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`);
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
    /** Récupération dynamiquement la liste des images dans la galerie */
    getVisibleImages() {
      const activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      const imagesCollection = [];

      $(".item-column:visible img.gallery-item").each(function () {
        if (activeTag === "all" || $(this).data("gallery-tag") === activeTag) {
          imagesCollection.push($(this));
        }
      });

      return imagesCollection;
    },

    /** IMAGES PRECEDENTES */
    prevImage(lightboxId) {
      const imagesCollection = $.fn.mauGallery.methods.getVisibleImages();
      const currentImage = $(`#${lightboxId} .lightboxImage`).attr("src");

      let index = imagesCollection.findIndex(img =>
        img.attr("data-full") === currentImage || img.attr("src") === currentImage
      );

      if (index <= 0) {
        index = imagesCollection.length;
      }

      const newSrc = imagesCollection[index - 1].attr("data-full") || imagesCollection[index - 1].attr("src");
      $(`#${lightboxId} .lightboxImage`).attr("src", newSrc);

    },

    /** IMAGES SUIVANTES */
    nextImage(lightboxId) {
      const imagesCollection = $.fn.mauGallery.methods.getVisibleImages();
      const currentImage = $(`#${lightboxId} .lightboxImage`).attr("src");

      let index = imagesCollection.findIndex(img =>
        img.attr("data-full") === currentImage || img.attr("src") === currentImage
      );

      if (index === -1 || index >= imagesCollection.length - 1) {
        index = -1;
      }

      const newSrc = imagesCollection[index + 1].attr("data-full") || imagesCollection[index + 1].attr("src");
      $(`#${lightboxId} .lightboxImage`).attr("src", newSrc);

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
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique" role="img" aria-live="polite"/>
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

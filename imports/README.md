# imports/

Drop a `.csv` here to add products — no local setup needed.

**How:** on GitHub, **Add file → Upload files**, drop your CSV in, and commit to
`main`. The *Import products from CSV* workflow picks it up, runs it through
classification and the quality gate, verifies the build, and opens a pull request
with the new product files. Review it and merge to deploy.

The workflow deletes the processed CSV in that same PR, so this folder does not
accumulate files that would be re-imported.

**Faster alternative:** if your CSV is already on the clipboard (the
[ASIN Collector](../public/tools/collector.html) bookmarklet puts it there), skip
the file entirely — go to **Actions → Import products from CSV → Run workflow**
and paste it into the box.

Format: see [`scripts/product-import-template.csv`](../scripts/product-import-template.csv)
and [`ADDING-PRODUCTS.md`](../ADDING-PRODUCTS.md).

Required columns: `url_or_asin`, `title`, `price`, `image`
Optional: `brand`, `type`, `occasion`, `recipient`

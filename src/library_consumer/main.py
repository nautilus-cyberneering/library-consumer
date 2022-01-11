import typer
import datetime
import json
from typer.main import Typer


app: Typer = typer.Typer()


@app.command()
def create_dummy_event(event_id: str, payload: str):
    typer.echo("Creating dummy event ...")

    now = ct = datetime.datetime.now()

    event = {
        "id": event_id,
        "payload": json.loads(payload),
        "metadata": {}
    }

    json_event = json.dumps(event, indent = 4)

    typer.echo(f"Event: {json_event}")

    filepath = f"gitmq/events/{event_id}.json"

    with open(filepath, 'w') as file:
        file.write(json_event)


@app.command()
def test():
    typer.echo("Test")


if __name__ == "__main__":
    app()
